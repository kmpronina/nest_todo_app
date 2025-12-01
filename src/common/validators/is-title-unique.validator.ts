import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TasksService } from 'src/tasks/tasks.service';

@ValidatorConstraint({ name: 'IsTitleUnique', async: true })
@Injectable()
export class IsTitleUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly tasksService: TasksService) {}

    async validate(title: string) {
        if (!title) {
            return true;
        }

        const task = await this.tasksService.findByTitle(title);

        return !!task;
    }

    defaultMessage(args: ValidationArguments) {
        return `Task with title "${args.value}" already exists. Choose another title please`;
    }
}

export function IsTitleUnique(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsTitleUnique',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsTitleUniqueConstraint
        });
    };
}
